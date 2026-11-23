CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`segment` varchar(64) NOT NULL,
	`goal` varchar(255) NOT NULL,
	`dish` varchar(255) NOT NULL,
	`offer` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`recipientsCount` int NOT NULL DEFAULT 0,
	`expectedOrders` int NOT NULL DEFAULT 0,
	`expectedRevenue` decimal(10,2) NOT NULL DEFAULT '0.00',
	`status` enum('rascunho','agendada','enviada') NOT NULL DEFAULT 'agendada',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversation_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` varchar(128) NOT NULL,
	`authorType` enum('cli','ia','hum','sys') NOT NULL,
	`authorName` varchar(128),
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversation_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` varchar(128) NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerPhone` varchar(32) NOT NULL,
	`neighborhood` varchar(255) DEFAULT 'Centro',
	`segment` varchar(64) DEFAULT 'Lead',
	`status` enum('ia','fila','humano','resolvida') NOT NULL DEFAULT 'ia',
	`assignedAgent` varchar(128),
	`handoffReason` varchar(255),
	`reasons` json DEFAULT ('[]'),
	`handoffsCount` int NOT NULL DEFAULT 0,
	`returnsCount` int NOT NULL DEFAULT 0,
	`cart` json DEFAULT ('[]'),
	`queuedAt` timestamp,
	`resolvedBy` varchar(64),
	`intent` varchar(128) DEFAULT 'Dúvida sobre o cardápio',
	`tags` json DEFAULT ('[]'),
	`saleAmount` decimal(10,2) DEFAULT '0.00',
	`firstResponseSeconds` int DEFAULT 3,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(32),
	`neighborhood` varchar(255) DEFAULT 'Centro',
	`segment` enum('fiel','novo','sumido','vip','regular','lead') NOT NULL DEFAULT 'novo',
	`ordersCount` int NOT NULL DEFAULT 0,
	`totalSpent` decimal(10,2) NOT NULL DEFAULT '0.00',
	`daysSinceLastOrder` int NOT NULL DEFAULT 0,
	`favoriteDish` varchar(255) DEFAULT 'Combo 26 Peças',
	`optIn` boolean NOT NULL DEFAULT true,
	`tags` json DEFAULT ('[]'),
	`recoveryWave` int DEFAULT 0,
	`recoveryStatus` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_base` (
	`id` varchar(128) NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`status` enum('pendente','aprovado','descartado') NOT NULL DEFAULT 'pendente',
	`origin` varchar(128) DEFAULT 'Cadastro manual',
	`conversationId` varchar(128),
	`usesCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `knowledge_base_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`profile` varchar(128) NOT NULL,
	`origin` varchar(128) DEFAULT 'Quiz',
	`prize` varchar(128) NOT NULL,
	`optIn` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`itemName` varchar(255) NOT NULL,
	`category` varchar(128) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPrice` decimal(10,2) NOT NULL,
	`unitCost` decimal(10,2) NOT NULL DEFAULT '0.00',
	`totalPrice` decimal(10,2) NOT NULL,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` int NOT NULL,
	`channel` varchar(64) NOT NULL DEFAULT 'PDV',
	`reference` varchar(255),
	`customerName` varchar(255) DEFAULT 'Cliente Balcão',
	`customerPhone` varchar(32),
	`neighborhood` varchar(255) DEFAULT 'Centro',
	`status` enum('novo','preparo','pronto','rota','entregue','cancelado') NOT NULL DEFAULT 'novo',
	`paymentMethod` varchar(64) NOT NULL DEFAULT 'Pix',
	`subtotal` decimal(10,2) NOT NULL,
	`deliveryFee` decimal(10,2) NOT NULL DEFAULT '0.00',
	`discount` decimal(10,2) NOT NULL DEFAULT '0.00',
	`total` decimal(10,2) NOT NULL,
	`cmv` decimal(10,2) NOT NULL DEFAULT '0.00',
	`nfcNumber` int,
	`nfcStatus` varchar(32) DEFAULT 'autorizada',
	`hasCpf` boolean NOT NULL DEFAULT false,
	`cpf` varchar(20),
	`riderName` varchar(128),
	`estimatedMinutes` int DEFAULT 45,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timeText` varchar(16) NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerPhone` varchar(32),
	`partySize` int NOT NULL,
	`origin` varchar(64) DEFAULT 'WhatsApp',
	`tags` json DEFAULT ('[]'),
	`status` enum('confirmada','aguardando','cancelada','atendida') NOT NULL DEFAULT 'aguardando',
	`isWaitlist` boolean NOT NULL DEFAULT false,
	`waitMinutes` int DEFAULT 0,
	`reservationDate` varchar(32) DEFAULT 'hoje',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reservations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` varchar(32) NOT NULL,
	`rating` int NOT NULL,
	`comment` text NOT NULL,
	`authorName` varchar(128) DEFAULT 'Cliente',
	`dateText` varchar(64) NOT NULL,
	`aiReply` text,
	`isReplied` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stock_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`unit` varchar(32) NOT NULL,
	`currentStock` decimal(10,2) NOT NULL,
	`minStock` decimal(10,2) NOT NULL,
	`unitCost` decimal(10,2) NOT NULL,
	`supplier` varchar(255) DEFAULT 'Pescados MT',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stock_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `stock_items_code_unique` UNIQUE(`code`)
);
