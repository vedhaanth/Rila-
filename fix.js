const fs = require('fs');
let code = fs.readFileSync('src/components/ProductsPage.tsx', 'utf8');

// 1. Remove the modal state and handlers
const stateStart = code.indexOf('// Manual Add Modal State');
const stateEndStr = "addToast('Error', 'Failed to save new product.');\n    }\n  };";
const stateEnd = code.indexOf(stateEndStr) + stateEndStr.length;
if (stateStart !== -1 && stateEnd !== -1) {
  code = code.substring(0, stateStart) + code.substring(stateEnd);
}

// 2. Remove the "Add Product Manually" button
const btnStartStr = '<button\n              onClick={handleOpenAddModal}';
const btnEndStr = '<Plus className="w-3.5 h-3.5" /> Add Product Manually\n            </button>';
const btnStart = code.indexOf(btnStartStr);
const btnEnd = code.indexOf(btnEndStr) + btnEndStr.length;
if (btnStart !== -1 && btnEnd !== -1) {
  code = code.substring(0, btnStart) + code.substring(btnEnd);
}

// 3. Remove the modal JSX
const modalStartStr = '{/* MANUAL ADD PRODUCT MODAL */}';
const modalEndStr = 'Save & Publish Product\n                </button>\n              </div>\n            </form>\n          </div>\n        </div>\n      )}';
const modalStart = code.indexOf(modalStartStr);
const modalEnd = code.indexOf(modalEndStr) + modalEndStr.length;
if (modalStart !== -1 && modalEnd !== -1) {
  code = code.substring(0, modalStart) + code.substring(modalEnd);
}

fs.writeFileSync('src/components/ProductsPage.tsx', code);
console.log("Done");
