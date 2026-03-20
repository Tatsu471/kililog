export type DateFormat = 'japanese' | 'slash'

interface Settings {
  dateFormat: DateFormat
}

const STORAGE_KEY = 'kirilog_settings'

const defaultSettings: Settings = {
  dateFormat: 'japanese'
}

export const settings = {
  get: (): Settings => {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings
  },

  set: (newSettings: Partial<Settings>) => {
    const current = settings.get()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...newSettings }))
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('kirilog_settings_updated'))
  }
}
