import 'server-only';
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {localDemo} from './config';
let db:DatabaseSync|undefined;
export function localDb(){if(!localDemo())throw new Error('로컬 데이터베이스는 로컬 테스트 모드 전용입니다.');if(!db){mkdirSync(join(process.cwd(),'.local-data'),{recursive:true});db=new DatabaseSync(join(process.cwd(),'.local-data','rankings.sqlite'));db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS places (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,name TEXT NOT NULL,search_name TEXT NOT NULL,address TEXT NOT NULL,start_date TEXT NOT NULL,is_active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS place_keywords (id TEXT PRIMARY KEY,place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,keyword TEXT NOT NULL,target_rank INTEGER NOT NULL DEFAULT 5,target_days INTEGER NOT NULL DEFAULT 25,is_active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,UNIQUE(place_id,keyword));
CREATE TABLE IF NOT EXISTS ranking_checks (id TEXT PRIMARY KEY,place_keyword_id TEXT NOT NULL REFERENCES place_keywords(id) ON DELETE CASCADE,rank INTEGER,matched INTEGER NOT NULL,provider TEXT NOT NULL,check_date TEXT NOT NULL,checked_at TEXT NOT NULL,raw_title TEXT,raw_data TEXT,created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS checks_keyword_date ON ranking_checks(place_keyword_id,check_date);
`);}return db;}
