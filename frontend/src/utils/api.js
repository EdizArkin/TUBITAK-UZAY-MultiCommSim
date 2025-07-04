export async function runTest() {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/run-test`);
  if (!res.ok) throw new Error('Network error');
  return res.json();
}
