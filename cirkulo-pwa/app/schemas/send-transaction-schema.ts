import { z } from "zod";

export const sendTransactionSchema = z.object({
  token: z.enum(["CBTC", "CUSD"], {
    message: "Please select a token",
  }),

  recipient: z
    .string()
    .min(1, "Recipient address is required")
    .refine(
      (val) => {
        const isEthAddress = /^0x[a-fA-F0-9]{40}$/.test(val);
        const isEnsName = /^[a-z0-9-]+\.eth$/.test(val);
        return isEthAddress || isEnsName;
      },
      { message: "Invalid address format. Use 0x... or username.eth" }
    ),

  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      { message: "Amount must be greater than zero" }
    )
    .refine(
      (val) => {
        const decimals = val.split(".")[1];
        return !decimals || decimals.length <= 18;
      },
      { message: "Maximum 18 decimal places" }
    ),
});

export type SendTransactionFormData = z.infer<typeof sendTransactionSchema>;
