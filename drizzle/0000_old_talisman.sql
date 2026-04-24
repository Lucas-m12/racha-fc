CREATE TYPE "public"."match_status" AS ENUM('agendada', 'finalizada');--> statement-breakpoint
CREATE TYPE "public"."posicao" AS ENUM('GOL', 'DEF', 'MEI', 'ATA');--> statement-breakpoint
CREATE TYPE "public"."team" AS ENUM('A', 'B');--> statement-breakpoint
CREATE TYPE "public"."tipo" AS ENUM('mensalista', 'avulso');--> statement-breakpoint
CREATE TYPE "public"."tx_categoria" AS ENUM('mensalidade', 'diaria', 'quadra', 'material', 'outros');--> statement-breakpoint
CREATE TYPE "public"."tx_tipo" AS ENUM('entrada', 'saida');--> statement-breakpoint
CREATE TABLE "match_players" (
	"match_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"presente" boolean DEFAULT false NOT NULL,
	"time" "team",
	"gols" integer DEFAULT 0 NOT NULL,
	"assists" integer DEFAULT 0 NOT NULL,
	"pagou" boolean DEFAULT false NOT NULL,
	"confirmado_em" bigint,
	CONSTRAINT "match_players_match_id_player_id_pk" PRIMARY KEY("match_id","player_id")
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"data" date NOT NULL,
	"local" text NOT NULL,
	"status" "match_status" DEFAULT 'agendada' NOT NULL,
	"placar_a" integer,
	"placar_b" integer,
	"custo_quadra" integer DEFAULT 0 NOT NULL,
	"observacao" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"posicao" "posicao" NOT NULL,
	"tipo" "tipo" NOT NULL,
	"mensalidade" integer DEFAULT 0 NOT NULL,
	"diaria" integer DEFAULT 0 NOT NULL,
	"cor" text NOT NULL,
	"telefone" text,
	"ativo" boolean DEFAULT true NOT NULL,
	"manual_ovr" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "players_nome_unique" UNIQUE("nome")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"admin_pin" text DEFAULT '1234' NOT NULL,
	"pix_key" text DEFAULT '' NOT NULL,
	"pix_owner" text DEFAULT '' NOT NULL,
	"max_confirmados" integer DEFAULT 14 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"data" date NOT NULL,
	"tipo" "tx_tipo" NOT NULL,
	"categoria" "tx_categoria" NOT NULL,
	"valor" integer NOT NULL,
	"descricao" text DEFAULT '' NOT NULL,
	"match_id" uuid,
	"player_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"voter_id" uuid NOT NULL,
	"rated_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "match_players" ADD CONSTRAINT "match_players_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_players" ADD CONSTRAINT "match_players_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_voter_id_players_id_fk" FOREIGN KEY ("voter_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_rated_id_players_id_fk" FOREIGN KEY ("rated_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "match_players_match_idx" ON "match_players" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "matches_status_data_idx" ON "matches" USING btree ("status","data");--> statement-breakpoint
CREATE INDEX "matches_data_idx" ON "matches" USING btree ("data");--> statement-breakpoint
CREATE UNIQUE INDEX "players_telefone_uniq" ON "players" USING btree ("telefone") WHERE "players"."telefone" is not null;--> statement-breakpoint
CREATE INDEX "players_ativo_idx" ON "players" USING btree ("ativo");--> statement-breakpoint
CREATE INDEX "transactions_data_idx" ON "transactions" USING btree ("data");--> statement-breakpoint
CREATE INDEX "transactions_match_idx" ON "transactions" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "transactions_player_idx" ON "transactions" USING btree ("player_id");--> statement-breakpoint
CREATE UNIQUE INDEX "votes_match_voter_rated_uniq" ON "votes" USING btree ("match_id","voter_id","rated_id");--> statement-breakpoint
CREATE INDEX "votes_match_idx" ON "votes" USING btree ("match_id");