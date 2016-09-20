module.exports = {
  namespace: 'ui',
  state: {},
  reducers: {
    set: (data, state) => {
      return data
    },
    reset: (property, state) => {
      return {[property]: null}
    }
  }
}
