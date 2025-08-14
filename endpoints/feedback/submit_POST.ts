import { db } from '../../helpers/db';
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { schema, OutputType } from './submit_POST.schema';
import superjson from 'superjson';
import { nanoid } from 'nanoid';

export async function handle(request: Request): Promise<Response> {
  try {
    const { user } = await getServerUserSession(request);
    const formData = await request.formData();
    
    const formValues: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      // Don't process files here, handle them separately
      if (key !== 'files') {
        formValues[key] = value;
      }
    });

    const validatedInput = schema.parse(formValues);

    // Process file attachments
    const files = formData.getAll('files');
    const fileAttachments = files.map(file => 
      file instanceof File ? { 
        name: file.name, 
        size: file.size, 
        type: file.type 
      } : null
    ).filter(Boolean);

    const ticketId = `TICKET-${nanoid(8).toUpperCase()}`;

    // Generate device info from user agent and other request headers
    const userAgent = request.headers.get('User-Agent') || '';
    const deviceInfo = {
      userAgent,
      timestamp: new Date().toISOString(),
      ...validatedInput.deviceInfo ? { additional: validatedInput.deviceInfo } : {}
    };

    // Insert into feedbackSubmissions table
    await db.insertInto('feedbackSubmissions').values({
      ticketId,
      userId: user.id,
      issueType: validatedInput.issueType,
      subject: validatedInput.subject,
      description: validatedInput.description,
      stepsToReproduce: validatedInput.stepsToReproduce || null,
      expectedBehavior: validatedInput.expectedBehavior || null,
      actualBehavior: validatedInput.actualBehavior || null,
      priority: validatedInput.priority,
      category: validatedInput.category,
      deviceInfo: deviceInfo,
      contactPreference: validatedInput.contactPreference,
      attachments: fileAttachments.length > 0 ? fileAttachments : null,
      status: 'new',
    }).execute();

    console.log(`Feedback submitted successfully with ticket ID: ${ticketId}`);

    const response: OutputType = {
      success: true,
      ticketId,
      message: 'Feedback submitted successfully.',
    };

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}