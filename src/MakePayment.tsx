import { Transaction } from "@mysten/sui/transactions";
import { Button, Container } from "@radix-ui/themes";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import ClipLoader from "react-spinners/ClipLoader";

export function MakePayment({
  onCreated,
}: {
  onCreated: (id: string) => void;
}) {
  const suiClient = useSuiClient();
  const {
    mutate: signAndExecute,
    isSuccess,
    isPending,
  } = useSignAndExecuteTransaction();

  function create() {
    const tx = new Transaction();

    const pay =
      "0x58bcf4d05e2c7ad9520ad8ba9ee3cb681e2a39ff62f6d7bb6d0ce8e95dcea384";
    const packageId =
      "0x8df135cdba18ed299d2e9e1116c73a4dcb4c2edecf1e6efa7888f2027bc96a53::pay::pay";

    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(2000000000)]);

    tx.moveCall({
      target: `${packageId}::pay::pay`,
      arguments: [tx.object(pay), coin, tx.pure.u64(1234567890)],
      // typeArguments: ["0x2::sui::SUI"],
    });
    tx.setGasBudget(10000000);

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async ({ digest }) => {
          const { effects } = await suiClient.waitForTransaction({
            digest: digest,
            options: {
              showEffects: true,
            },
          });

          onCreated(effects?.created?.[0]?.reference?.objectId!);
        },
      },
    );
  }

  return (
    <Container>
      <Button
        size="3"
        onClick={() => {
          create();
        }}
        disabled={isSuccess || isPending}
      >
        {isSuccess || isPending ? <ClipLoader size={20} /> : "Pay"}
      </Button>
    </Container>
  );
}
