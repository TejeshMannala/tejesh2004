export const getDefaultRouteForRole = (role) => {
  if (role === 'admin') {
    return '/admin';
  }

  if (role === 'doctor') {
    return '/doctor-dashboard';
  }

  return '/';
};
