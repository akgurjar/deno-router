export class Context {
  readonly req: Request;
  readonly params: Record<string, string | undefined>;
  readonly config: object = {};
  constructor(req: Request, params: Record<string, string | undefined>) {
    this.req = req;
    this.params = params;
  }
  json(data: unknown) {
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
