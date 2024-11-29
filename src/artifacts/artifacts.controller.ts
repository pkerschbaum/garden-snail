import {
  Controller,
  Get,
  Head,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { StorageService } from "../storage/storage.service";
import { ArtifactsGuard } from "./artifacts.guard";
import { GetArtifactRO, PutArtifactRO, StatusRO } from "./artifacts.interface";
import { ArtifactQueryTeamPipe } from "./artifacts.pipe";

@Controller({ path: "artifacts", version: "8" })
@UseGuards(ArtifactsGuard)
export class ArtifactsController {
  private readonly logger = new Logger(ArtifactsController.name);

  constructor(private readonly storageService: StorageService) {}

  @Get("status")
  getStatus(): StatusRO {
    this.logger.log("GET /status");
    return { status: "enabled" };
  }

  @Head(":hash")
  async artifactExists(
    @Param("hash") hash: string,
    @Query(new ArtifactQueryTeamPipe()) team: string,
  ): Promise<void> {
    this.logger.log(`HEAD /${hash} team: ${team}`);
    const exists = await this.storageService.exists(team, hash);
    if (!exists) throw new NotFoundException("Artifact not found");
  }

  @Get(":hash")
  async getArtifact(
    @Param("hash") hash: string,
    @Query(new ArtifactQueryTeamPipe()) team: string,
  ): Promise<GetArtifactRO> {
    this.logger.log(`GET /${hash} team: ${team}`);
    const exists = await this.storageService.exists(team, hash);
    if (!exists) throw new NotFoundException("Artifact not found");

    const content = await this.storageService.read(team, hash);
    return new StreamableFile(content);
  }

  @Put(":hash")
  async putArtifact(
    @Param("hash") hash: string,
    @Query(new ArtifactQueryTeamPipe()) team: string,
    @Req() request: Request,
  ): Promise<PutArtifactRO> {
    this.logger.log(`PUT /${hash} team: ${team}`);
    await this.storageService.write(team, hash, request);
    return { urls: [`${team}/${hash}`] };
  }

  @Post()
  @HttpCode(501)
  queryArtifact(): void {
    this.logger.log(`POST /`);
    // Documented in OpenAPI but currently unused
    return;
  }

  @Post("events")
  @HttpCode(200)
  postEvents(): void {
    this.logger.log(`POST /events`);
    // We currently dont't record any events
    return;
  }
}
