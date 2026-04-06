import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function PUT(req, { params }) {
  try {
    const formData = await req.formData();

    const name = formData.get("name");
    const price = formData.get("price");
    const category = formData.get("category");
    const image = formData.get("image");
    const image_url_input = formData.get("image_url");

    let image_url = image_url_input || "";

    if (image && typeof image === "object" && image.size > 0) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${fileExt}`;

      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, buffer, {
          contentType: image.type,
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: uploadError.message },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      image_url = publicUrlData.publicUrl;
    }

    const payload = {
      name,
      price: Number(price),
      category,
    };

    if (image_url) {
      payload.image_url = image_url;
    }

    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const { error } = await supabase.from("products").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}