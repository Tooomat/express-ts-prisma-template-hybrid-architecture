export class HttpException extends Error {
    public status: number

    constructor(status: number, message: string) {
        super(message)
        this.status = status
    }
}


export class BadRequestException extends HttpException {
    constructor(message: string) {
        super(400, message)
    }
}

export class UnauthorizedException extends HttpException {
    constructor(message: string) {
        super(401, message)
    }
}

export class ForbiddenException extends HttpException {
    constructor(message: string) {
        super(403, message)
    }
}

export class Exception  extends HttpException {
    constructor(message: string) {
        super(404, message)
    }
}

export class ConflictException  extends HttpException {
    constructor(message: string) {
        super(409, message)
    }
}

export class GoneException  extends HttpException {
    constructor(message: string) {
        super(410, message)
    }
}

export class UnprocessableEntityException extends HttpException {
    constructor(message: string) {
        super(422, message)
    }
}

export class TooManyRequestsException  extends HttpException {
    constructor(message: string) {
        super(429, message)
    }
}

export class InternalServerException  extends HttpException {
    constructor(message: string) {
        super(500, message)
    }
}

export class BadGatewayException  extends HttpException {
    constructor(message: string) {
        super(502, message)
    }
}

export class ServiceUnavailableException  extends HttpException {
    constructor(message: string) {
        super(503, message)
    }
}