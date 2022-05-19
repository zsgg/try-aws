import { GetServerSideProps } from 'next';

// @ts-ignore
const Page = ({ ran }) => {
  return <div>hello deploy page@page1: {ran}</div>;
};

export const getServerSideProps: GetServerSideProps = async () => {
  console.log(`< hello page@nginx1 getServerSideProps >`);
  return {
    props: { ran: Math.random().toString() },
  };
};

export default Page;
