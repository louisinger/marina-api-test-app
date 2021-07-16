import { useState } from "react";
import { testRunner } from "../runner";
import { Test, TestResult } from "../runner/types";
import { getMarina } from "../utils/marina";
import TestView from "./TestView";

export interface RunnerProps {
  tests: Test[];
}

const Runner: React.FC<RunnerProps> = ({ tests }) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const before = async () => {
    const marina = getMarina();
    const isEnabled = await marina.isEnabled();
    if (!isEnabled) {
      await marina.enable();
    }
  };

  const runTests = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      setResults([]);
      for await (const testResult of testRunner(tests, before)) {
        setResults((r) => r.concat([testResult]));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const views = results.map((result, index) => (
    <span className={result.success ? "success" : "error"}>
      <TestView key={index} index={index} {...result} />
    </span>
  ));

  return (
    <div className="flex flex-row-reverse justify-between w-full m-5">
      <div>
        <div className="flex flex-col-reverse">
          {isLoading && (
            <span className="text-sm m-2 pb-3 animate-pulse">loading...</span>
          )}
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-3"
            onClick={runTests}
            disabled={isLoading}
          >
            RUN
          </button>
        </div>
      </div>
      <div className="ml-3">{views}</div>
    </div>
  );
};

export default Runner;
