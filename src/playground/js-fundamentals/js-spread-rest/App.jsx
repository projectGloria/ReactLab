export default function Settings() {
  const baseColors = ["red", "blue"];
  const allColors = baseColors.concat(["green"]); 

  const profile = { name: "Sam", theme: "light" };
  const updatedProfile = Object.assign({}, profile, { theme: "dark" });

  return (
    <div>
      <p>Colors: {allColors.join(", ")}</p>
      <p>Theme: {updatedProfile.theme}</p>
    </div>
  );
}