// import type { Core } from '@strapi/strapi';

function generateMemberNumber(): string {
  const prefix = "FT";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    strapi.db.lifecycles.subscribe({
      models: ["plugin::users-permissions.user"],

      async beforeCreate(event) {
        const { data } = event.params;

        // 改成 user_id
        if (!data.user_id) {
          let userId;
          let isUnique = false;

          while (!isUnique) {
            userId = generateMemberNumber();

            const existing = await strapi.db
              .query("plugin::users-permissions.user")
              .findOne({
                where: { user_id: userId }, // 改這裡
              });

            isUnique = !existing;
          }

          data.user_id = userId; // 改這裡
          console.log("✅ Generated user_id:", userId);
        }
      },
    });

    console.log("🚀 User ID generator is ready!");
  },
};
