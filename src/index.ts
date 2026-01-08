import type { Core } from "@strapi/strapi";

function generateMemberNumber(): string {
  const prefix = "FT";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

async function generateOrderNumber(strapi: Core.Strapi): Promise<string> {
  // 取得今天日期: 20250108
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

  // 計算今日已有幾筆訂單
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const todayEnd = new Date(today.setHours(23, 59, 59, 999));

  const count = await strapi.db.query("api::order.order").count({
    where: {
      createdAt: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    },
  });

  // 流水號補 0: 001, 002, 003...
  const sequence = String(count + 1).padStart(3, "0");

  return `ORD-${dateStr}-${sequence}`;
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
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // ✅ 訂閱 User 創建事件
    strapi.db.lifecycles.subscribe({
      models: ["plugin::users-permissions.user"],

      async beforeCreate(event) {
        const { data } = event.params;

        // 如果還沒有 user_id，就自動生成一個
        if (!data.user_id) {
          let userId;
          let isUnique = false; // 標記：這個編號是否唯一

          // 🔄 重複生成直到找到唯一的編號
          // 為什麼需要這樣做？
          // 雖然機率很低，但時間戳 + 隨機碼理論上還是可能重複
          // 例如：同一毫秒內多個用戶同時註冊，且隨機碼剛好相同
          while (!isUnique) {
            // 1️⃣ 生成新的會員編號
            userId = generateMemberNumber();

            // 2️⃣ 到資料庫查詢：是否已經有人使用這個編號？
            const existing = await strapi.db
              .query("plugin::users-permissions.user")
              .findOne({
                where: { user_id: userId },
              });

            // 3️⃣ 判斷結果
            // - 如果 existing 是 null → 沒有人用 → 這個編號可以用 ✅
            // - 如果 existing 有值 → 已經有人用了 → 重新生成 ❌
            isUnique = !existing;
          }

          // 確保編號唯一後，才賦值給新用戶
          data.user_id = userId;
          console.log("✅ Generated user_id:", userId);
        }
      },
    });

    // ✅ 訂閱 Order 創建事件
    strapi.db.lifecycles.subscribe({
      models: ["api::order.order"],

      async beforeCreate(event) {
        const { data } = event.params;

        // 如果還沒有訂單編號，就自動生成一個
        if (!data.order_number) {
          let orderNumber;
          let isUnique = false;

          // 🔄 重複生成直到找到唯一的訂單編號
          // 為什麼訂單編號也需要檢查重複？
          // 雖然有日期 + 流水號，但在「高併發」情況下可能出問題：
          //
          // 例如：兩筆訂單「同時」進來
          // ┌─────────────┬─────────────┐
          // │  訂單 A      │  訂單 B      │
          // ├─────────────┼─────────────┤
          // │ count = 5   │ count = 5   │ ← 幾乎同時查詢，都得到 5
          // │ 編號 = 006  │ 編號 = 006  │ ← 產生相同編號！💥
          // └─────────────┴─────────────┘
          //
          // 透過檢查重複 + 重新生成，可以避免這個問題
          while (!isUnique) {
            // 1️⃣ 生成新的訂單編號（基於日期 + 今日訂單數）
            orderNumber = await generateOrderNumber(strapi);

            // 2️⃣ 檢查資料庫是否已存在相同編號
            const existing = await strapi.db.query("api::order.order").findOne({
              where: { order_number: orderNumber },
            });

            // 3️⃣ 沒有重複就可以使用
            isUnique = !existing;
          }

          data.order_number = orderNumber;
          console.log("✅ Generated order_number:", orderNumber);
        }
      },
    });

    console.log("🚀 User ID & Order Number generators are ready!");
  },
};
