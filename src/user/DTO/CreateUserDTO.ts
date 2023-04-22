export default class CreateUserDTO {
    constructor(
        public firstName: string,
        public lastName: string,
        public login: string, 
        public password: string
    ) {}
}
