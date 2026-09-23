import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const temporaryConfigDirectory = mkdtempSync(join(tmpdir(), 'relish-npm-'));
const isolatedNpmConfig = join(temporaryConfigDirectory, '.npmrc');
writeFileSync(isolatedNpmConfig, '');
const npmEnvironment = { ...process.env };
delete npmEnvironment.npm_config_allow_scripts;
delete npmEnvironment.NPM_CONFIG_ALLOW_SCRIPTS;

const result = spawnSync(npmCommand, [
  'install',
  '--include=optional',
  '--ignore-scripts',
  '--no-audit',
  '--no-fund',
  `--userconfig=${isolatedNpmConfig}`
], { stdio: 'inherit', shell: process.platform === 'win32', env: npmEnvironment });

rmSync(temporaryConfigDirectory, { recursive: true, force: true });

if (result.error) throw result.error;
process.exit(result.status ?? 1);
