export type UserRegistrationProps = {
  id: string
  type: 'email' | 'text' | 'password' | 'select'
  inputType: 'select' | 'input'
  options?: { value: string; label: string; id: string }[]
  label?: string
  placeholder: string
  name: string
  condition?: (values: any) => boolean
}

export const USER_REGISTRATION_FORM: UserRegistrationProps[] = [
  {
    id: '1',
    inputType: 'input',
    placeholder: 'Full name',
    name: 'fullname',
    type: 'text',
  },
  {
    id: '2',
    inputType: 'select',
    placeholder: 'District',
    name: 'district',
    type: 'select',
  },
  {
    id: '3',
    inputType: 'select',
    placeholder: 'Designation',
    name: 'role',
    type: 'select',
  },
  {
    id: '4',
    inputType: 'select',
    placeholder: 'Select Parent',
    name: 'parentId',
    type: 'select',
  },
  {
    id: '5',
    inputType: 'input',
    placeholder: 'Username',
    name: 'username',
    type: 'text',
  },
  {
    id: '6',
    inputType: 'input',
    placeholder: 'Email',
    name: 'email',
    type: 'email',
  },
  {
    id: '7',
    inputType: 'input',
    placeholder: 'Contact Number',
    name: 'contactNumber',
    type: 'text',
  },
  {
    id: '8',
    inputType: 'input',
    placeholder: 'Password',
    name: 'password',
    type: 'password',
  },
  {
    id: '9',
    inputType: 'input',
    placeholder: 'Confirm Password',
    name: 'confirmPassword',
    type: 'password',
  },
]

export const USER_LOGIN_FORM: UserRegistrationProps[] = [
  {
    id: '1',
    inputType: 'input',
    placeholder: 'Enter your username',
    name: 'username',
    type: 'text',
  },
  {
    id: '2',
    inputType: 'input',
    placeholder: 'Password',
    name: 'password',
    type: 'password',
  },
]