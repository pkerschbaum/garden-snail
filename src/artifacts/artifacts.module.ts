import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { StorageModule } from "../storage/storage.module";
import { StorageService } from "../storage/storage.service";
import { ArtifactsController } from "./artifacts.controller";

@Module({
  controllers: [ArtifactsController],
  providers: [StorageService, ConfigService],
  imports: [StorageModule],
})
export class ArtifactsModule {}
