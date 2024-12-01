const HF_API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev";
const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

export const generateCreature = async (creatureType: string, rarity: string): Promise<Blob | null> => {
    const creatureStyles: Record<string, any> = {
        dragon: {
            common: {
                size: "small",
                traits: "playful, friendly, smooth-scaled, glowing eyes",
                style: "a whimsical, approachable design",
                colors: ["soft green", "gentle blue", "pastel yellow"],
            },
            rare: {
                size: "medium",
                traits: "mystical, slightly intimidating, sharp scales, glowing veins",
                style: "a refined and magical design",
                colors: ["emerald green", "royal purple", "bronze"],
            },
            epic: {
                size: "large",
                traits: "battle-worn, fearsome, fire-spewing, highly detailed",
                style: "a dominating and aggressive appearance",
                colors: ["fiery red", "obsidian black", "molten gold"],
            },
            legendary: {
                size: "huge",
                traits: "mythical, awe-inspiring, surrounded by elemental effects, intricate wing patterns",
                style: "a grand, celestial design evoking godlike power",
                colors: ["iridescent rainbow", "midnight blue with starlight specks", "silver and gold blend"],
            },
        },
        tiger: {
            common: {
                size: "small",
                traits: "cute, playful, soft-furred, gentle gaze",
                style: "a cartoonish, approachable design",
                colors: ["orange with white stripes", "golden yellow", "light gray"],
            },
            rare: {
                size: "medium",
                traits: "a mature cub look, sharp-eyed, defined stripes",
                style: "a sleek, predatory appearance",
                colors: ["purple and golden ", "black and silver", "rich purple and blue"],
            },
            epic: {
                size: "large",
                traits: "majestic, fierce, rippling muscles, intense glare",
                style: "a bold and commanding presence",
                colors: ["white and gold scaled", "jet black", "peacock green feathered"],
            },
            legendary: {
                size: "huge",
                traits: "ethereal, mythical, luminous aura, intricate stripe patterns",
                style: "a divine, celestial design blending predator and deity",
                colors: ["glowing white with golden accents", "shimmering blue with silver stripes", "fire and ash pattern"],
            },
        },
    };

    if (!creatureStyles[creatureType] || !creatureStyles[creatureType][rarity]) {
        throw new Error("Invalid creature type or rarity.");
    }

    const details = creatureStyles[creatureType][rarity];
    const color = details.colors[Math.floor(Math.random() * details.colors.length)];
    const prompt = `A hyperrealistic depiction of a ${rarity} monster that looks like a ${creatureType}, featuring a ${details.size} build with ${details.traits}. It has ${details.style}, and its unique coloration includes ${color}. This design embodies the essence of a ${rarity} ${creatureType}-like monster.`;

    try {
        const response = await fetch(HF_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${HF_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: prompt }),
        });

        if (!response.ok) {
            throw new Error(`Hugging Face API error: ${response.statusText}`);
        }

        const blob = await response.blob();
        return blob;
    } catch (error) {
        console.error(error);
        return null;
    }
};