export enum RedeemInviteCodeStatus {
  OK = 0,
  INVALID = 1,
  USED = 2,
  UNAUTHORIZED = 3,
  UNNECESSARY = 4,
}

export interface RedeemInviteCodeRes {
  status: typeof RedeemInviteCodeStatus
  code: string
}
