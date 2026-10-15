const baseColors = ['red', 'blue'];
const allColors = baseColors.concat(['green']);

const profile = { name: 'Sam', theme: 'light' };
const updatedProfile = Object.assign({}, profile, { theme: 'dark' });

export default function App() {
  return `Colors: ${allColors.join(', ')} | Theme: ${updatedProfile.theme}`;
}
