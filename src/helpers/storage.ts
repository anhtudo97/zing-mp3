const PREFIX = 'TUANH_'

export const saveObject = (key: string, val: any): void => {
  localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(val))
}

export const getObject = (key: string): any => {
  const data = localStorage.getItem(`${PREFIX}${key}`)
  try {
    return JSON.parse(data) || false
  } catch (error) {
    return false
  }
}
