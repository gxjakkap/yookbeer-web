export enum Roles {
  UNAUTHORIZED = "unauthorized",
  USER = "user",
  ADMIN = "admin",
  SUPERADMIN = "superadmin",
}

export const isAdmin = (role: Roles | string): boolean => {
  return role === Roles.ADMIN || role === Roles.SUPERADMIN
}

export const isAuthorized = (role: Roles | string): boolean => {
  return role !== Roles.UNAUTHORIZED
}

export const isSuperAdmin = (role: Roles | string): boolean => {
  return role === Roles.SUPERADMIN
}
