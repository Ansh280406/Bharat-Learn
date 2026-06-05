const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'ar', 'CustomARScene.tsx');
let f = fs.readFileSync(filePath, 'utf8');

f = f.replace(/v = \?\?\?\(2GM\/R\)/g, 'v = √(2GM/R)');
f = f.replace(/\(x\?\?\?-x\?\?\?\)\?\?\+\(y\?\?\?-y\?\?\?\)\?\?/g, '(x₂-x₁)²+(y₂-y₁)²');
f = f.replace(/\?\?\?\(b\?\?-4ac\)/g, '√(b²-4ac)');
f = f.replace(/\?\?=b\?\?-4ac/g, 'Δ=b²-4ac');
f = f.replace(/x\?\?\?\(y\?\?\?-y\?\?\?\)\+x\?\?\?\(y\?\?\?-y\?\?\?\)\+x\?\?\?\(y\?\?\?-y\?\?\?\)/g, 'x₁(y₂-y₃)+x₂(y₃-y₁)+x₃(y₁-y₂)');
f = f.replace(/\?\?\|/g, '½|');
f = f.replace(/< 0 \? maximum/g, '< 0 → maximum');
f = f.replace(/> 0 \? minimum/g, '> 0 → minimum');
f = f.replace(/h\?0/g, 'h→0');
f = f.replace(/\?\?g'\(x\)/g, "·g'(x)");
f = f.replace(/\? first large-scale/g, '— first large-scale');
f = f.replace(/109\.5\?\? to 104\.5\?\?/g, '109.5° to 104.5°');
f = f.replace(/\(\?\?\)/g, '(δ+)');
f = f.replace(/\? this makes it an aldehyde!/g, '— this makes it an aldehyde!');
f = f.replace(/\? rain, snow/g, '→ rain, snow');
f = f.replace(/\? all FCC!/g, '— all FCC!');
f = f.replace(/\? 8x larger!/g, '— 8x larger!');
f = f.replace(/\? lasts until 1857!/g, '— lasts until 1857!');
f = f.replace(/\? Parisians storm/g, '— Parisians storm');
f = f.replace(/\? "Liberty/g, '— "Liberty');
f = f.replace(/\(CH\?\?\? \+ O\?\)/g, '(CH₄ + O₂)');
f = f.replace(/\?\?H/g, 'ΔH');
f = f.replace(/\(CO\? \+ H\?O\)/g, '(CO₂ + H₂O)');
f = f.replace(/CH\?\?\?\+2O\? \? CO\?\+2H\?O/g, 'CH₄+2O₂ → CO₂+2H₂O');
f = f.replace(/\?\?I\/2\?\?r/g, 'μ₀I/2πr');
f = f.replace(/\?\?\?B\?\?dl=\?\?I/g, '∮B·dl=μ₀I');
f = f.replace(/\?\? \?\? current enclosed/g, 'μ₀ × current enclosed');
f = f.replace(/\? B circles/g, '→ B circles');
f = f.replace(/\?\?nI/g, 'μ₀nI');
f = f.replace(/\? line rises/g, '→ line rises');
f = f.replace(/\? line falls/g, '→ line falls');
f = f.replace(/\? 3x=3 \? x=1/g, '→ 3x=3 → x=1');
f = f.replace(/\? slope = 2\/1 = 2/g, '→ slope = 2/1 = 2');
f = f.replace(/\?\?\?\(x\?\?\+y\?\?\+z\?\?\)/g, '√(x²+y²+z²)');
f = f.replace(/l=cos\?\?, m=cos\?\?, n=cos\?\?/g, 'l=cosα, m=cosβ, n=cosγ');
f = f.replace(/l\?\?\+m\?\?\+n\?\?=1/g, 'l²+m²+n²=1');
f = f.replace(/\(x\?\?\?,y\?\?\?,z\?\?\?\)/g, '(x₁,y₁,z₁)');
f = f.replace(/\|ax\?\?\?\+by\?\?\?\+cz\?\?\?-d\|\/\?\?\?\(a\?\?\+b\?\?\+c\?\?\)/g, '|ax₁+by₁+cz₁-d|/√(a²+b²+c²)');
f = f.replace(/eâ\?\?\»/g, 'e⁻');
f = f.replace(/Nuâ\?\?\»/g, 'Nu⁻');
f = f.replace(/eâ\?\?\»/g, 'e⁻');
f = f.replace(/eâ\?/g, 'e⁻');
f = f.replace(/Nuâ\?/g, 'Nu⁻');

f = f.replace(/CHâ\?\?/g, 'CH₃');
f = f.replace(/Hâ\?\?/g, 'H₂');

f = f.replace(/eâ\?/g, 'e⁻');
f = f.replace(/Nuâ\?/g, 'Nu⁻');

fs.writeFileSync(filePath, f, 'utf8');
console.log('Replaced symbols in CustomARScene.tsx');
