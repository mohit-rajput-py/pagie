import { NextResponse } from "next/server";

const students = {
    "24BCADS135": {
        eid: "24BCADS135",
        name: "Rahul Patil",
        class: "BCA-2",
        department: "BCA"
    },
    "24BCADS136": {
        eid: "24BCADS136",
        name: "Priya Shah",
        class: "BCA-2",
        department: "BCA"
    }
};

export async function GET(request, { params }) {

    const student = students[params.eid];

    if (!student) {
        return NextResponse.json(
            { error: "Student not found" },
            { status: 404 }
        );
    }

    return NextResponse.json(student);
}