import { Badge, Card, Empty, PageHeader, Spinner, Table, Td, fmtDate, useFetch } from "../../components/ui";

export default function TestResults() {
  const { data, loading } = useFetch("/patient/tests");
  if (loading) return <Spinner />;
  return (
    <>
      <PageHeader title="Test Results" subtitle="Laboratory and diagnostic reports." />
      <Card className="!p-2">{data.length === 0 ? <Empty>No test results yet.</Empty> : (
        <Table head={["Test", "Date", "Result", "Status"]}>{data.map((t) => <tr key={t.id}><Td className="font-medium">{t.name}</Td><Td>{fmtDate(t.date)}</Td><Td>{t.result}</Td><Td><Badge>{t.status}</Badge></Td></tr>)}</Table>)}
      </Card>
    </>
  );
}
