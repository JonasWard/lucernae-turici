import { ProcessingMethods } from '../../geometryGeneration/voxelComplex';
import { ProcessingMethodRenderer } from './GeometryProcessingMethodInput';

export const PostProcessingRenderer: React.FC<{
  postProcessing: { twist: ProcessingMethods; skew: ProcessingMethods };
  setPostProcessing: (postProcessing: { twist: ProcessingMethods; skew: ProcessingMethods }) => void;
}> = ({ postProcessing, setPostProcessing }) => {
  const setTwist = (method: ProcessingMethods) => setPostProcessing({ ...postProcessing, twist: { ...postProcessing.twist, ...method } as ProcessingMethods });
  const setSkew = (method: ProcessingMethods) => setPostProcessing({ ...postProcessing, skew: { ...postProcessing.skew, ...method } as ProcessingMethods });

  return (
    <>
      <h3>{'Post Processing'}</h3>
      <div key='twist'>
        <span>Twist</span>
        <ProcessingMethodRenderer method={postProcessing.twist} updateMethod={setTwist} />
      </div>
      <div key='skew'>
        <span>Skew</span>
        <ProcessingMethodRenderer method={postProcessing.skew} updateMethod={setSkew} />
      </div>
    </>
  );
};
