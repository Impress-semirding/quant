type ValueOf<T> = T[keyof T];
type ValueKeyOf<T, U extends keyof T> = ValueOf<(Pick<T, U>)>

export type {
  ValueOf,
  ValueKeyOf
}