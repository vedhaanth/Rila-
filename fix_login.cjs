const fs = require('fs');
let code = fs.readFileSync('src/components/LoginModal.tsx', 'utf8');

// 1. Remove the Admin ERP tab button
code = code.replace(/<button\\s+onClick=\\{[^}]*setMode\\('admin'\\)\\}[\\s\\S]*?<\\/button>/, '');

// 2. Change the state from <'login' | 'register' | 'admin'> to <'login' | 'register'>
code = code.replace(/useState<'login' \\| 'register' \\| 'admin'>\\('login'\\)/, "useState<'login' | 'register'>('login')");

// 3. Update handleCustomSubmit
const newSubmit = `  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin1@smartretail.com' && password === 'admin123') {
      loginAsAdmin1();
    } else if (email === 'admin2@smartretail.com' && password === 'admin123') {
      loginAsAdmin2();
    } else if (mode === 'register') {
      setCurrentUser({
        user_id: \`CUST-\${Date.now().toString().slice(-4)}\`,
        name: name || 'Shopping Customer',
        email: email || 'customer@gmail.com',
        role: 'customer'
      });
      setCurrentPortal('customer');
      addToast('Welcome!', \`Account created for \${name || email}\`);
      setIsLoginModalOpen(false);
    } else {
      setCurrentUser({
        user_id: \`CUST-\${Date.now().toString().slice(-4)}\`,
        name: name || 'Shopping Customer',
        email: email || 'customer@gmail.com',
        role: 'customer'
      });
      setCurrentPortal('customer');
      addToast('Welcome Back!', \`Logged in as \${email}\`);
      setIsLoginModalOpen(false);
    }
  };`;

const oldSubmitRegex = /const handleCustomSubmit = \(e: React\.FormEvent\) => \{[\s\S]*?\};\n/m;
code = code.replace(oldSubmitRegex, newSubmit + '\n');

// 4. Remove '{mode !== 'admin' && (' around quick demo login
code = code.replace(/\\{\\s*mode !== 'admin' && \\(\s*(<div className="p-4 bg-amber-50\/80[\s\S]*?<\/div>)\s*\\)\\s*\\}/, '$1');

// 5. Remove admin hint
code = code.replace(/\\{\\s*mode === 'admin' && \\(\s*<div className="mb-3 p-3 bg-amber-50\/50[\s\S]*?<\/div>\s*\\)\\s*\\}/, '');

// 6. Update placeholders/labels
code = code.replace(/\\{\\s*mode === 'admin' \? 'Admin Username or Email' : 'Email Address'\\s*\\}/g, "'Email Address'");
code = code.replace(/placeholder=\\{mode === 'admin' \? 'admin1@smartretail\\.com' : 'john@gmail\\.com'\\}/g, 'placeholder="john@gmail.com"');

// 7. Update submit button text
code = code.replace(/\\{\\s*mode === 'admin' && 'Access Selected Admin Portal'\\s*\\}/, '');

fs.writeFileSync('src/components/LoginModal.tsx', code);
console.log("Done");
