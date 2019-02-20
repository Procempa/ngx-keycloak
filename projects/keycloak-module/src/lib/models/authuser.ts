export interface User {
  surname: string;
  name: string;
  fullName: string
  email: string
  username: string
  attributes: {
    [key: string]: string[]
  }
}
