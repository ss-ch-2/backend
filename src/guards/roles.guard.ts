import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Roles, ROLES_KEY } from "src/decorators/roles.decorator";

@Injectable()

export class RolesGuard implements CanActivate
{
    constructor(private reflector:Reflector){}

    canActivate(context: ExecutionContext): boolean
    {
        const requiredroles = this.reflector.getAllAndOverride <string []> (ROLES_KEY,[
            context.getHandler(),
            context.getClass()
        ]);
        if (!requiredroles) return true;
        const request = context.switchToHttp().getRequest();

         if (!request.user){
            throw new UnauthorizedException("Access refusé : Utilisateur non authentifié ",
                "Missing Authentification"
            );
         }

         try {

            return requiredroles.some(Roles => request.user.roles === Roles);
         }

         catch(error)
         {
            throw new UnauthorizedException("Erreur de vérification de role", "Role validation failed");
         }
    }

}