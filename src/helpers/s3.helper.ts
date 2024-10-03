import { AWS_BUCKET_NAME } from '@/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export const s3Upload = async (userId: string, file: any) => {
  const s3Client = new S3Client();

  const param = {
    Bucket: AWS_BUCKET_NAME,
    Key: `uploads/profile/${userId}-${file.originalname}`,
    Body: file.buffer,
  };
  s3Client.send(new PutObjectCommand(param))
  const imageUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${param.Key}`;
  return imageUrl;
};

export const s3ProductUpload = async (productId: string, file: any) => {
  const s3Client = new S3Client();

  const param = {
    Bucket: AWS_BUCKET_NAME,
    Key: `uploads/products/${productId}-${file.originalname}`,
    Body: file.buffer,
  };
  s3Client.send(new PutObjectCommand(param))
  const imageUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${param.Key}`;
  return imageUrl;
};

// export const postUpload = async (userId: string, file: any) => {
//   const s3Client = new S3Client();

//   const param = {
//     Bucket: AWS_BUCKET_NAME,
//     Key: `uploads/posts/${userId}-${file.originalname}`,
//     Body: file.buffer,
//   };
//   s3Client.send(new PutObjectCommand(param))
//   const imageUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${param.Key}`;
//   return imageUrl;
// };
