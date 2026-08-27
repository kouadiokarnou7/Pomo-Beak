import { NextResponse } from "next/server";
import { z } from "zod";

// Définition du schéma de validation d'entrée
const reminderSchema = z.object({
  email: z.string().email("Format d'e-mail invalide."),
  taskName: z.string().min(1, "Le nom de la tâche ne peut pas être vide.").max(255, "Le nom de la tâche est trop long."),
  dueDate: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validation stricte du corps de la requête avec Zod
    const validation = reminderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Données d'entrée invalides.", 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { email, taskName, dueDate } = validation.data;

    console.log(`[RAPPEL EMAIL SIMULÉ] Envoyé à: ${email}`);
    console.log(`Tâche: "${taskName}"`);
    console.log(`Date d'échéance: ${dueDate || "Non spécifiée"}`);

    // Ici, vous pourrez configurer votre propre fournisseur d'email.
    // Exemple avec Resend ou Nodemailer :
    /*
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: 'pomoBEAK <no-reply@pomobeak.com>',
      to: email,
      subject: `Rappel de tâche : ${taskName}`,
      html: `<p>Bonjour,</p><p>Ceci est un rappel pour votre tâche : <strong>${taskName}</strong> qui arrive à échéance le ${dueDate}.</p>`
    });
    */

    return NextResponse.json({
      success: true,
      message: `Rappel par e-mail simulé avec succès pour la tâche "${taskName}".`,
      data: {
        to: email,
        taskName,
        dueDate,
        sentAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erreur lors du traitement du rappel : " + error.message },
      { status: 500 }
    );
  }
}
