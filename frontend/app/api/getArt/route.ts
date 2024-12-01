"use server";
import { NextRequest, NextResponse } from "next/server";
import { generateCreature } from "@/functions/genAI";


async function posthandler(req: NextRequest) {
    if (req.method !== "POST") {
        return NextResponse.json({ error: "Invalid request method" }, { status: 405 });
    }
    const { creatureType, rarity } = await req.json();

    if (!creatureType || !rarity) {
        return NextResponse.json({ error: "Missing creature type or rarity" }, { status: 400 });
    }

    try {
        const blob = await generateCreature(creatureType, rarity);
        const headers = new Headers();

        headers.set("Content-Type", "image/*");

        return new NextResponse(blob, { status: 200, statusText: "OK", headers });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

export {
    posthandler as POST
}