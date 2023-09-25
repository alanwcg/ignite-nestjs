import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { z } from 'zod'
import { PrismaService } from 'src/prisma/prisma.service'
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe'
import { CurrentUser, JwtAuthGuard, UserPayload } from '../auth'

const bodySchema = z.object({
  title: z.string(),
  content: z.string(),
})

type BodySchema = z.infer<typeof bodySchema>

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(bodySchema)) body: BodySchema,
  ) {
    const { sub: userId } = user
    const { title, content } = body

    await this.prisma.question.create({
      data: {
        authorId: userId,
        title,
        content,
        slug: this.convertToSlug(title),
      },
    })
  }

  private convertToSlug(title: string) {
    const slugText = title
      .normalize('NFKD')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/_/g, '')
      .replace(/--+/g, '-')
      .replace(/-$/g, '')

    return slugText
  }
}
