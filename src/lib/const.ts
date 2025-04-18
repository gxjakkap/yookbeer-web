export const COURSE_SHORTHAND = ['REG', 'INT', 'HDS', 'RC']
export const COURSE_PRETTYNAME = ['Regular Program', 'International Program', 'Health Data Science Program', 'Residential College']

export enum Courses {
    REG = 0,
    INT = 1,
    HDS = 2,
    RC = 3
}

export enum Roles {
    UNAUTHORIZED = "unauthorized",
    USER = "user",
    ADMIN = "admin"
}

export enum InviteStatus {
    UNUSED = "unused",
    CLAIMED = "claimed"
}
