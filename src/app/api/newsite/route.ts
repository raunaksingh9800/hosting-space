import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";

// Route validation function
const validateRoute = (routeName: string): boolean => {
  if (!routeName) return false;
  
  // Only allow letters, numbers, and hyphens
  const validRouteRegex = /^[a-zA-Z0-9-]+$/;
  return validRouteRegex.test(routeName);
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, routeName, buildType } = await req.json();

  if (!name || !routeName || !buildType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Validate route name format
  if (!validateRoute(routeName)) {
    return NextResponse.json(
      { error: "Route name can only contain letters, numbers, and hyphens (-)" },
      { status: 400 }
    );
  }

  // Check if routeName already exists
  const exists = await prisma.site.findFirst({ where: { routeName } });
  if (exists) {
    return NextResponse.json({ error: "Route already taken" }, { status: 409 });
  }

  const user = await prisma.user.findUnique({ where: { authId: userId } });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Create the site
  const site = await prisma.site.create({
    data: {
      name,
      routeName,
      buildType,
      ownerId: user.id,
    },
  });

  // Increment the user's site count
  await prisma.user.update({
    where: { id: user.id },
    data: { siteCount: { increment: 1 } },
  });

  const redis = await getRedisClient();
  await redis.set(
    routeName,
    `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to hosting space</title>
  <style>
    div {
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: sans-serif;
    }
  </style>
</head>
<body>
  <div>
    <h1 style="font-weight: 400;">Welcome to Hosting <strong>Space</strong></h1>
    <p>This project's name is ${name}</p>
  </div>
</body>
</html>
`
  );

  return NextResponse.json({ site }, { status: 201 });
}