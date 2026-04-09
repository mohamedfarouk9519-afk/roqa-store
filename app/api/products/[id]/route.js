import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminUser } from "@/lib/isAdmin";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function PUT(req, { params }) {
  try {
    const admin = await isAdminUser();
    if (!admin.ok) {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
    }

    const { id } = params;
    const formData = await req.formData();

    const name = String(formData.get("name") || "");
    const price = Number(formData.get("price") || 0);
    const category_id = formData.get("category_id") || null;
    const imageFile = formData.get("image");
    const imageUrlInput = String(formData.get("image_url") || "");

    const payload = {
      name,
      price,
      category_id,
    };

    if (imageUrlInput) {
      payload.image_url = imageUrlInput;
    }

    if (imageFile instanceof File && imageFile.size > 0) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${fileExt}`;

      const arrayBuffer = await imageFile.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, fileBuffer, {
          contentType: imageFile.type,
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

      payload.image_url = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .select("*, categories(name)");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data?.[0] || null);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const admin = await isAdminUser();
    if (!admin.ok) {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
    }

    const { id } = params;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}