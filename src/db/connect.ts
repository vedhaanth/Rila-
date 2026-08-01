import * as dns from 'dns';
import mongoose from 'mongoose';

const DNS_FALLBACK_SERVERS = ['8.8.8.8', '1.1.1.1'];
const DOH_ENDPOINT = 'https://cloudflare-dns.com/dns-query';

function normalizeHost(host: string) {
  return host.endsWith('.') ? host.slice(0, -1) : host;
}

function buildFallbackUri(uri: string, hosts: Array<{ host: string; port: number }>) {
  const parsed = new URL(uri);
  const auth = parsed.username ? `${parsed.username}${parsed.password ? `:${parsed.password}` : ''}@` : '';
  const dbName = parsed.pathname === '/' ? '' : parsed.pathname;
  const params = new URLSearchParams(parsed.search);
  if (!params.has('tls') && !params.has('ssl')) {
    params.set('tls', 'true');
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  const hostList = hosts.map((h) => `${h.host}:${h.port}`).join(',');
  return `mongodb://${auth}${hostList}${dbName}${query}`;
}

async function resolveSrvRecords(name: string) {
  const response = await fetch(`${DOH_ENDPOINT}?name=${encodeURIComponent(name)}&type=SRV`, {
    headers: { Accept: 'application/dns-json' }
  });
  if (!response.ok) {
    throw new Error(`DNS-over-HTTPS lookup failed: ${response.statusText}`);
  }
  const payload = await response.json();
  const answers = Array.isArray(payload.Answer) ? payload.Answer : [];
  return answers
    .map((answer: any) => {
      const [priority, weight, port, target] = String(answer.data || '').split(' ');
      return target && port ? { host: normalizeHost(target), port: Number(port) } : null;
    })
    .filter(Boolean) as Array<{ host: string; port: number }>;
}

export async function connectToDatabase() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is not defined. Atlas connection is required.');
  }

  const connectOptions = {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000
  };

  try {
    await mongoose.connect(uri, connectOptions);
    console.log('Connected to Atlas');
    return mongoose.connection;
  } catch (error) {
    const err = error as Error;
    if (!uri.startsWith('mongodb+srv://')) {
      throw err;
    }

    const srvName = uri.replace(/^mongodb\+srv:\/\//, '').split('/')[0];
    const dnsName = `_mongodb._tcp.${srvName}`;

    try {
      dns.setServers(DNS_FALLBACK_SERVERS);
      await mongoose.connect(uri, connectOptions);
      console.log('Connected to Atlas using fallback DNS servers');
      return mongoose.connection;
    } catch (dnsError) {
      console.warn('SRV lookup failed with fallback servers:', (dnsError as Error).message);
    }

    try {
      const records = await resolveSrvRecords(dnsName);
      if (!records.length) {
        throw new Error('No SRV records found via DNS-over-HTTPS fallback');
      }
      for (const record of records) {
        const fallbackUri = buildFallbackUri(uri, [record]);
        try {
          await mongoose.connect(fallbackUri, connectOptions);
          console.log('Connected to Atlas using DNS-over-HTTPS fallback');
          return mongoose.connection;
        } catch (recordError) {
          console.warn(`Failed to connect to ${record.host}:${record.port} via DNS-over-HTTPS fallback:`, (recordError as Error).message);
        }
      }
      throw new Error('Unable to connect to any SRV fallback host');
    } catch (dohError) {
      const combined = `${err.message}; fallback error: ${(dohError as Error).message}`;
      throw new Error(combined);
    }
  }
}
