export async function POST() {
  return Response.json(
    {
      error:
        "Use authClient.changePassword() from the authenticated client flow instead of this route.",
    },
    { status: 405 },
  );
}