import './App.css'
import { CCNInput } from './components/CCNInput'
import { ManualInputsForm } from './components/ManualInputsForm'
import { FacilityPreview } from './components/FacilityPreview'

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>INFINITE — Managed by MEDELITE</h1>
          <p className="subtitle">Facility Assessment Snapshot Report Generator</p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <CCNInput />
          <ManualInputsForm />
          <FacilityPreview />
        </div>
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 INFINITE Health Technology Platform. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
