import 'server-only';
import {mockProvider} from './providers/mock';
import {naverLocalProvider} from './providers/naverLocal';
import type {RankingProvider} from './provider';
const providers:Record<string,RankingProvider>={mock:mockProvider,'naver-local':naverLocalProvider};
export function currentProviderId(){return process.env.RANKING_PROVIDER || (process.env.NODE_ENV==='production'?'unconfigured':'mock');}
export function getProvider(){const provider=providers[currentProviderId()];if(!provider)throw new Error('RANKING_PROVIDER를 mock 또는 naver-local로 설정해주세요.');return provider;}
