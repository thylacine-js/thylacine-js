export class Config
{
    public static get ROUTE_ROOT() : string {
         return process.env.ROUTE_ROOT ?? "/routes/";
    }

    public static get LAZY_LOAD() : boolean {
        return Boolean(process.env.LAZY_LOAD ?? true);
    }

}