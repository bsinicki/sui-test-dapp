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
      "0xd1ba872771a986563deb19c1a8bab640a2d60df12a15b2373ecc407e12ea8944";
    const packageId =
      "0x272500990eb152a7dd2ba4bdb825a6780e6b16443a4a046eec38d11675e16ad5::pay::pay";

    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(200000000)]);

    tx.moveCall({
      target: `${packageId}::pay::pay`,
      arguments: [tx.object(pay), coin, tx.pure.u64(Math.floor(Math.random() * 100000))],
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
