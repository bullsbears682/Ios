export default function Settings() {
  return (
    <div>
      <h2>Settings</h2>
      <div>
        <label><input type="checkbox" defaultChecked /> Enable notifications</label>
      </div>
      <div>
        <label><input type="checkbox" defaultChecked /> Allow location access</label>
      </div>
      <div>
        <label>Language
          <select defaultValue="en">
            <option value="en">English</option>
            <option value="de">Deutsch</option>
          </select>
        </label>
      </div>
    </div>
  )
}