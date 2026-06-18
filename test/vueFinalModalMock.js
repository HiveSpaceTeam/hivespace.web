module.exports = {
  createVfm: () => ({
    install: () => undefined,
  }),
  ModalsContainer: {
    name: 'ModalsContainer',
    template: '<div data-testid="modals-container" />',
  },
  VueFinalModal: {
    name: 'VueFinalModal',
    template: '<div data-testid="vue-final-modal"><slot /></div>',
  },
}
