import resend from "../config/resend.js";
import { welcomeTemplate } from "../templates/welcome.template.js";

class EmailService {

    async sendWelcomeEmail(user, password) {

        try {

            return await resend.emails.send({

                from: process.env.EMAIL_FROM,

                to: user.email,

                subject: "Welcome to BuildTrack",

                html: welcomeTemplate(user, password)

            });

        } catch (error) {

            console.error(error);

            throw error;

        }

    }

}

export default new EmailService();