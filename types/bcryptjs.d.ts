declare module "bcryptjs" {
  export function genSaltSync(rounds?: number): string;
  export function hashSync(s: string, salt: string | number): string;
  export function compareSync(s: string, hash: string): boolean;
  export function getRounds(hash: string): number;
}
