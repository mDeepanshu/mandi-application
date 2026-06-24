let _showSnackbar = null;

export const registerSnackbar = (fn) => { _showSnackbar = fn; };

export const showSnackbar = ({ open, alertType, alertMsg }) => {
  if (_showSnackbar) _showSnackbar({ open, alertType, alertMsg });
};
